import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod"

const UpVoteSchema = z.object({
    streamId: z.string(),

})

export async function POST(req: NextRequest){
    const session = await getServerSession();

    const user = await prisma.user.findFirst({
        where:{
            email: session?.user?.email || ""
        }
    })

    if(!user){
        return NextResponse.json({
            message: "Unauthorized"
        },{
            status: 403
        })
    }

    try {
        const data = UpVoteSchema.parse(await req.json());
        // console.log(data);
        //Prevent user from upvoting twice
        await prisma.upVote.create({
            data:{
                userId: user.id,
                streamId: data.streamId
            }
        })

        return NextResponse.json({
            message : "DONE!"
        },{
            status: 200
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: "Error while upvoting"
        },{
            status: 411
        }
        )
    }

  

    
}