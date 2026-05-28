import AddCommentUseCase from '../AddCommentUseCase.js';
import CreateComment from '../../../Domains/comments/entities/CreateComment.js';
import CreatedComment from '../../../Domains/comments/entities/CreatedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const expectedCreatedComment = new CreatedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addComment = vi.fn().mockResolvedValue(expectedCreatedComment);

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExists = vi.fn().mockResolvedValue(undefined);

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(createdComment).toStrictEqual(expectedCreatedComment);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(new CreateComment(useCasePayload));
  });
});
