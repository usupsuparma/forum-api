import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyReplyExists = vi.fn().mockResolvedValue(undefined);
    mockReplyRepository.verifyReplyOwner = vi.fn().mockResolvedValue(undefined);
    mockReplyRepository.deleteReply = vi.fn().mockResolvedValue(undefined);

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExists = vi.fn().mockResolvedValue(undefined);

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue(undefined);

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.replyId);
  });
});
