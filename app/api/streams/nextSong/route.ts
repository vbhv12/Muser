import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    const session = await getServerSession();
    const user = await prisma.user.findFirst({
        where:{
            email: session?.user?.email ?? ""
        }
    });

    if(!user){
        return NextResponse.json({
            message: "Unauthorized"
        },{
            status: 403
        })
    }

    const mostUpVotedStream = await prisma.stream.findFirst({
        where: {
          userId: user.id,
          active: true
        },
        orderBy: {
          upVotes: {
            _count: 'desc'
          }
        }
      });


      if(!mostUpVotedStream){
        return NextResponse.json({ message: "No next song available" }, { status: 404 });
      }

      await prisma.currentStream.upsert({
        where: {
          userId: user.id
        },
        update: {
          streamId: mostUpVotedStream.id
        },
        create: {
          userId: user.id,
          streamId: mostUpVotedStream.id
        }
      })
      // console.log("Upserted: " , res);
      await prisma.stream.update({
        where: {
            id: mostUpVotedStream?.id
        },
        data:{
          active: false
        }
      })
      

    return NextResponse.json({
        stream: mostUpVotedStream
    })
}