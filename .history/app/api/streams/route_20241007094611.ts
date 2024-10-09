import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import axios from "axios";

const YT_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?!.*\blist=)(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;

const API_KEY = process.env.API_KEY;
const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
})

export async function POST(req: NextRequest){
    try {
        const data = CreateStreamSchema.parse(await req.json());
        console.log("DATA: " , data?.url);
        const isYt = data.url.match(YT_REGEX);

        if(!isYt){
            return NextResponse.json({
                message: "Wrong Url Format"
            }, {
                status: 411
            }
            )
        }
        const url = data.url;
        const extractedId = data.url.split("?v=")[1]
        const ytData= await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=id&part=snippet&id=${extractedId}&key=${API_KEY}`);
        
        const yt_title = ytData.data.items[0]?.snippet.title;
        const maxResImg = ytData.data.items[0]?.snippet.thumbnails.maxres;
        const standardResImg = ytData.data.items[0]?.snippet.thumbnails.standard;
        const stream = await prisma.stream.create({
            data:{
                userId: data.creatorId,
                url,
                extractedId,
                title: yt_title ?? "Can't find Video",
                smallImageURL: standardResImg?.url ?? "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
                bigImageURL: maxResImg?.url ?? "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
                type: "Youtube"
            }
        })

        console.log(stream)

        return NextResponse.json({
            message: "Stream Added",
            id: stream.id
        },
        {
            status:200
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: "Error while adding a stream"
        }, {
            status: 400
        }
        )
    }

}

export async function GET(req: NextRequest) {
    try {
        const creatorId = req.nextUrl.searchParams.get("creatorId");
        const session = await getServerSession(authOptions);

        // Check for authentication
        if (!session?.user) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 403
            });
        }

        // Check for creatorId
        if (!creatorId) {
            return NextResponse.json({
                message: "CreatorId is required"
            }, {
                status: 411
            });
        }

        const user = session.user;

        // Perform database queries concurrently
        const [streams, activeStream] = await Promise.all([
            await prisma.stream.findMany({
                where: {
                    userId: creatorId
                },
                include: {
                    upVotes: {
                        where: {
                            userId: user.id
                        }
                    },
                    _count: {
                        select: {
                            upVotes: true
                        }
                    }
                }
            }),
            await prisma.currentStream.findFirst({
                where: {
                    userId: creatorId
                },
                include: {
                    stream: true
                }
            })
        ]);

        // Process and return the results
        return NextResponse.json({
            streams: streams.map(({ _count, ...rest }) => ({
                ...rest,
                upvotes: _count.upVotes,
                haveUpVoted: rest.upVotes.length > 0
            })),
            activeStream
        });

    } catch (error) {
        console.error("Error fetching streams:", error);
        return NextResponse.json({
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}