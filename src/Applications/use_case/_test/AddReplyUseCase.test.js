import AddReplyUseCase from '../AddReplyUseCase.js';
import CreateReply from '../../../Domains/replies/entities/CreateReply.js';
import CreatedReply from '../../../Domains/replies/entities/CreatedReply.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah balasan',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const expectedCreatedReply = new CreatedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.addReply = vi.fn().mockResolvedValue(expectedCreatedReply);

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue(undefined);

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue(undefined);

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(createdReply).toStrictEqual(expectedCreatedReply);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new CreateReply({ content: useCasePayload.content, commentId: useCasePayload.commentId, owner: useCasePayload.owner }),
    );
  });
});
