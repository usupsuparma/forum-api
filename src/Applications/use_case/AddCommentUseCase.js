import CreateComment from '../../Domains/comments/entities/CreateComment.js';

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { content, threadId, owner } = useCasePayload;
    await this._threadRepository.verifyThreadExists(threadId);
    const createComment = new CreateComment({ content, threadId, owner });
    return this._commentRepository.addComment(createComment);
  }
}

export default AddCommentUseCase;
