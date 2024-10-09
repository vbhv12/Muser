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
        }
        )
    }

    try {
        const data = UpVoteSchema.parse(await req.json());
        //Prevent user from upvoting twice
        await prisma.upVote.delete({
            where:{
                userId_streamId:{
                    userId: user.id,
                    streamId: data.streamId
                }
                
            }
        })
    } catch (error) {
        return NextResponse.json({
            message: "Not UpVote twice"
        },{
            status: 411
        }
        )
    }

  

    
}