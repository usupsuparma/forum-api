import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('Threads endpoint', () => {
  let app;
  let accessToken;
  let accessToken2;

  beforeAll(async () => {
    app = await createServer(container);

    await request(app).post('/users').send({
      username: 'threadtestuser',
      password: 'secret',
      fullname: 'Thread Test User',
    });
    const loginResp1 = await request(app).post('/authentications').send({
      username: 'threadtestuser',
      password: 'secret',
    });
    accessToken = loginResp1.body.data.accessToken;

    await request(app).post('/users').send({
      username: 'threadtestuser2',
      password: 'secret',
      fullname: 'Thread Test User 2',
    });
    const loginResp2 = await request(app).post('/authentications').send({
      username: 'threadtestuser2',
      password: 'secret',
    });
    accessToken2 = loginResp2.body.data.accessToken;
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual('sebuah thread');
      expect(response.body.data.addedThread.owner).toBeDefined();
    });

    it('should response 400 when request payload is incomplete', async () => {
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread' });

      expect(response.status).toEqual(400);
    });

    it('should response 401 when missing authentication', async () => {
      const response = await request(app)
        .post('/threads')
        .send({ title: 'sebuah thread', body: 'isi thread' });

      expect(response.status).toEqual(401);
    });
  });

  describe('GET /threads/:threadId', () => {
    it('should response 200 and return thread detail', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const response = await request(app).get(`/threads/${threadId}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual(threadId);
      expect(response.body.data.thread.comments).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const response = await request(app).get('/threads/thread-not-exist');

      expect(response.status).toEqual(404);
    });
  });

  describe('POST /threads/:threadId/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual('sebuah komentar');
    });

    it('should response 400 when request payload is incomplete', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toEqual(400);
    });

    it('should response 404 when thread not found', async () => {
      const response = await request(app)
        .post('/threads/thread-not-exist/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(404);
    });

    it('should response 401 when missing authentication', async () => {
      const response = await request(app)
        .post('/threads/thread-123/comments')
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(401);
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId', () => {
    it('should response 200 when comment deleted successfully', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      const { id: commentId } = commentResponse.body.data.addedComment;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when deleting other user comment', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      const { id: commentId } = commentResponse.body.data.addedComment;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      expect(response.status).toEqual(403);
    });

    it('should response 401 when missing authentication', async () => {
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123');

      expect(response.status).toEqual(401);
    });
  });

  describe('POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should response 201 and persisted reply', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      const { id: commentId } = commentResponse.body.data.addedComment;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual('sebuah balasan');
    });

    it('should response 400 when request payload is incomplete', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      const { id: commentId } = commentResponse.body.data.addedComment;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toEqual(400);
    });

    it('should response 401 when missing authentication', async () => {
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .send({ content: 'sebuah balasan' });

      expect(response.status).toEqual(401);
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 200 when reply deleted successfully', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      const { id: commentId } = commentResponse.body.data.addedComment;

      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      const { id: replyId } = replyResponse.body.data.addedReply;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when deleting other user reply', async () => {
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      const { id: commentId } = commentResponse.body.data.addedComment;

      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      const { id: replyId } = replyResponse.body.data.addedReply;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      expect(response.status).toEqual(403);
    });

    it('should response 401 when missing authentication', async () => {
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123');

      expect(response.status).toEqual(401);
    });
  });
});