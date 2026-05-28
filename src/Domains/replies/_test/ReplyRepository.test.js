import ReplyRepository from '../ReplyRepository.js';

describe('ReplyRepository interface', () => {
  it('should throw error when invoke abstract method addReply', async () => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.addReply({})).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract method verifyReplyExists', async () => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.verifyReplyExists('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract method verifyReplyOwner', async () => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.verifyReplyOwner('', '')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract method deleteReply', async () => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.deleteReply('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke abstract method getRepliesByCommentIds', async () => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.getRepliesByCommentIds([])).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
