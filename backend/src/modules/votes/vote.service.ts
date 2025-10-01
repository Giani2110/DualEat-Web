import { prisma } from "../../prisma/prisma";
import { ContentType, VoteType, Prisma } from "@prisma/client";

export class VoteService {
  constructor() {}

  private async updateContentVotes(
    tx: Prisma.TransactionClient,
    content_type: ContentType,
    content_id: string,
    data: any
  ) {
    if (content_type === ContentType.post) {
      return tx.post.update({ where: { id: content_id }, data });
    }
    if (content_type === ContentType.comment) {
      return tx.postComment.update({ where: { id: content_id }, data });
    }
    if (content_type === ContentType.food) {
      return tx.food.update({ where: { id: content_id }, data });
    }
    throw new Error("Tipo de contenido no soportado");
  }

  async createVote(
    vote_type: VoteType,
    content_id: string,
    content_type: ContentType,
    user_id: string
  ) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const existingVote = await tx.vote.findFirst({
          where: {
            user_id,
            content_id,
            content_type,
          },
        });

        /**
         * CASO 1: El usuario repite el mismo voto (toggle → elimina su voto)
         */
        if (existingVote && existingVote.vote_type === vote_type) {
          await tx.vote.delete({
            where: { id: existingVote.id },
          });

          const decrementData =
            vote_type === VoteType.up
              ? { votes_up: { decrement: 1 } }
              : { votes_down: { decrement: 1 } };

          await this.updateContentVotes(
            tx,
            content_type,
            content_id,
            decrementData
          );

          return { action: "deleted", vote: null };
        }

        /**
         * CASO 2: El usuario cambia de voto (de up → down o viceversa)
         */
        if (existingVote) {
          const updatedVote = await tx.vote.update({
            where: { id: existingVote.id },
            data: {
              vote_type,
              updated_at: new Date(),
            },
          });

          const decrementKey =
            existingVote.vote_type === VoteType.up ? "votes_up" : "votes_down";
          const incrementKey =
            vote_type === VoteType.up ? "votes_up" : "votes_down";

          const updateData = {
            [decrementKey]: { decrement: 1 },
            [incrementKey]: { increment: 1 },
          };

          await this.updateContentVotes(
            tx,
            content_type,
            content_id,
            updateData
          );

          return { action: "updated", vote: updatedVote };
        } else {
          /**
           * CASO 3: El usuario vota por primera vez
           */
          const newVote = await tx.vote.create({
            data: {
              user_id,
              content_id,
              content_type,
              vote_type,
            },
          });

          const incrementData =
            vote_type === VoteType.up
              ? { votes_up: { increment: 1 } }
              : { votes_down: { increment: 1 } };

          await this.updateContentVotes(
            tx,
            content_type,
            content_id,
            incrementData
          );

          return { action: "created", vote: newVote };
        }
      });

      return result;
    } catch (error) {
      console.error("Error en createVote:", error);
      throw error;
    }
  }
}
