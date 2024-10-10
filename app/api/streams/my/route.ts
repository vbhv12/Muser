import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){

    try{
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return NextResponse.json({
                message:
                    "Unauthorized"
                },
                {
                    status: 403
                }
            )
        }
    
        const user = session.user;

        const streams = await prisma.stream.findMany({
            where: {
                userId: user.id
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
        });
        

        // console.log(streams);
    
        return NextResponse.json({
            streams: streams.map(({_count, ...rest}) =>({
                    ...rest,
                    upvotes: _count.upVotes,
                    haveUpVoted: rest.upVotes.length ? true: false
                }))
        });
        
    }
    catch(e){
        return NextResponse.json({
            message: "Cannot Fetch your Songs"
        }, {
            status: 400
        })
    }
    
}