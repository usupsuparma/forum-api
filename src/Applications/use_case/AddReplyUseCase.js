import CreateReply from '../../Domains/replies/entities/CreateReply.js';

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { content, commentId, threadId, owner } = useCasePayload;
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    const createReply = new CreateReply({ content, commentId, owner });
    return this._replyRepository.addReply(createReply);
  }
}

export default AddReplyUseCase;
