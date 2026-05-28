class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((c) => c.id);
    const replies = commentIds.length > 0
      ? await this._replyRepository.getRepliesByCommentIds(commentIds)
      : [];

    const commentsWithReplies = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      replies: replies
        .filter((r) => r.commentId === comment.id)
        .map((r) => ({
          id: r.id,
          content: r.isDelete ? '**balasan telah dihapus**' : r.content,
          date: r.date,
          username: r.username,
        })),
      content: comment.isDelete ? '**komentar telah dihapus**' : comment.content,
    }));

    return {
      ...thread,
      comments: commentsWithReplies,
    };
  }
}

export default GetThreadDetailUseCase;
