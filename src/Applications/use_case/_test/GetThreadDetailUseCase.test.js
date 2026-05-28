import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThread = {
      id: threadId,
      title: 'sebuah thread',
      body: 'isi thread',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-111',
        username: 'johndoe',
        date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'sebuah comment',
        isDelete: false,
      },
      {
        id: 'comment-222',
        username: 'dicoding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'komentar yang dihapus',
        isDelete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-111',
        commentId: 'comment-111',
        username: 'dicoding',
        date: new Date('2021-08-08T07:59:48.766Z'),
        content: 'balasan yang dihapus',
        isDelete: true,
      },
      {
        id: 'reply-222',
        commentId: 'comment-111',
        username: 'johndoe',
        date: new Date('2021-08-08T08:07:01.522Z'),
        content: 'sebuah balasan',
        isDelete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = vi.fn().mockResolvedValue(mockThread);

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = vi.fn().mockResolvedValue(mockComments);

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByCommentIds = vi.fn().mockResolvedValue(mockReplies);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-111', 'comment-222']);

    expect(threadDetail).toStrictEqual({
      id: threadId,
      title: 'sebuah thread',
      body: 'isi thread',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'dicoding',
      comments: [
        {
          id: 'comment-111',
          username: 'johndoe',
          date: new Date('2021-08-08T07:22:33.555Z'),
          replies: [
            {
              id: 'reply-111',
              content: '**balasan telah dihapus**',
              date: new Date('2021-08-08T07:59:48.766Z'),
              username: 'dicoding',
            },
            {
              id: 'reply-222',
              content: 'sebuah balasan',
              date: new Date('2021-08-08T08:07:01.522Z'),
              username: 'johndoe',
            },
          ],
          content: 'sebuah comment',
        },
        {
          id: 'comment-222',
          username: 'dicoding',
          date: new Date('2021-08-08T07:26:21.338Z'),
          replies: [],
          content: '**komentar telah dihapus**',
        },
      ],
    });
  });

  it('should return thread detail with empty replies when no comments', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThread = {
      id: threadId,
      title: 'sebuah thread',
      body: 'isi thread',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'dicoding',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = vi.fn().mockResolvedValue(mockThread);

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = vi.fn().mockResolvedValue([]);

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByCommentIds = vi.fn();

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockReplyRepository.getRepliesByCommentIds).not.toBeCalled();
    expect(threadDetail.comments).toStrictEqual([]);
  });
});
