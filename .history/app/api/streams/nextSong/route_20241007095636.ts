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
          userId: user.id
        },
        orderBy: {
          upVotes: {
            _count: 'desc'
          }
        }
      });

      console.log("Most UpVoted Stream" , mostUpVotedStream);

      if(!mostUpVotedStream){
        return null;
      }

      const res = await prisma.currentStream.upsert({
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
      console.log("Upserted: " , res);
      // const stream_res = await prisma.stream.delete({
      //   where: {
      //       id: mostUpVotedStream?.id
      //   }
      // })
      // console.log("Deleted: " , stream_res);


      // if (mostUpVotedStream?.id) {
      //   await Promise.all([
      //     await prisma.currentStream.upsert({
      //       where: {
      //         userId: user.id
      //       },
      //       update: {
      //         streamId: mostUpVotedStream.id
      //       },
      //       create: {
      //         userId: user.id,
      //         streamId: mostUpVotedStream.id
      //       }
      //     }),
      //     await prisma.stream.delete({
      //       where: {
      //           id: mostUpVotedStream?.id
      //       }
      //     })
      //   ]);
      // } else {
      //   console.log("No upvoted stream found for the user");
      // }

    return NextResponse.json({
        stream: mostUpVotedStream
    })
}