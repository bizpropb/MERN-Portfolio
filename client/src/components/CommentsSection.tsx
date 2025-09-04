import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Comment {
  _id: string;
  content: string;
  rating?: number;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    username?: string;
  };
  createdAt: string;
  replies: Comment[];
  replyCount: number;
}

interface CommentsSectionProps {
  projectId: string;
  currentUserId?: string;
}

// Isolated comments section to prevent full modal re-render on comment submission
const CommentsSection: React.FC<CommentsSectionProps> = ({
  projectId,
  currentUserId
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchComments();
    }
  }, [projectId]);

  const fetchComments = async () => {
    if (!projectId) return;
    
    try {
      setLoadingComments(true);
      const response = await fetch(`http://localhost:5001/api/comments/project/${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/comments/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment.trim(),
          rating: newRating
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Optimistic update - add new comment directly to existing comments
        const newCommentWithReplies = {
          ...data.data,
          replies: [],
          replyCount: 0
        };
        
        setComments(prevComments => [newCommentWithReplies, ...prevComments]);
        setNewComment('');
        setNewRating(null);
      } else {
        alert('Error submitting comment: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Network error submitting comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/comments/project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentCommentId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Optimistic update - add reply to the correct parent comment
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === parentCommentId 
              ? {
                  ...comment,
                  replies: [...comment.replies, data.data],
                  replyCount: comment.replyCount + 1
                }
              : comment
          )
        );
        setReplyContent('');
        setReplyingTo(null);
      } else {
        alert('Error submitting reply: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Network error submitting reply');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="border-t pt-8">
      <h3 className="text-xl font-semibold mb-6 lightmode-text-primary dark:darkmode-text-primary">
        Comments & Feedback
      </h3>
      
      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8 p-4 lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-2">
            Your Comment
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this project..."
            rows={3}
            className="text-sm w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-2">
            Rating <span className="text-primary">*</span>
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isLit = hoveredRating 
                ? star <= hoveredRating 
                : newRating && star <= newRating;
              
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(newRating === star ? null : star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className={`w-8 h-8 text-2xl transition-colors ${
                    isLit ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmittingComment || !newComment.trim() || !newRating}
          className="px-4 py-2 btn-primary-filled shadow-lg"
        >
          {isSubmittingComment ? (
            <>
              <div className="text-sm animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
              Submitting...
            </>
          ) : (
            'Post Comment'
          )}
        </button>
      </form>

      {/* Comments List */}
      {loadingComments ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm lightmode-text-primary dark:darkmode-text-primary text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="border-l-4 border-primary pl-4">
              <div className="lightmode dark:darkmode rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {comment.userId.username ? (
                      <Link
                        to={`/userspace/${comment.userId.username}/profile`}
                        className="font-medium text-primary hover:text-primary-highlight transition-colors duration-200"
                      >
                        {comment.userId.username}
                      </Link>
                    ) : (
                      <span className="font-medium">
                        {comment.userId.username}
                      </span>
                    )}
                    {comment.rating && (
                      <div className="flex text-yellow-400">
                        {'★'.repeat(comment.rating)}
                        {'☆'.repeat(5 - comment.rating)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary mb-3">{comment.content}</p>
                
                <button
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="text-xs text-primary hover:text-primary-highlight"
                >
                  Reply
                </button>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <div className="mt-4 p-3 lightmode dark:darkmode rounded-lg">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      rows={2}
                      className="text-sm w-full px-3 py-2 border lightmode-text-secondary dark:darkmode-text-secondary dark:darkmode rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors mb-2"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubmitReply(comment._id)}
                        disabled={!replyContent.trim()}
                        className="px-3 py-1 btn-primary-filled text-xs"
                      >
                        Post Reply
                      </button>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-xs px-4 py-2 lightmode dark:darkmode text-lightmode-text-primary dark:darkmode-text-primary rounded-md hover:lightmode-highlight dark:hover:darkmode-highlight transition-colors"
                        >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-4 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="lightmode dark:darkmode rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          {reply.userId.username ? (
                            <Link
                              to={`/userspace/${reply.userId.username}/profile`}
                              className="font-medium text-sm text-primary hover:text-primary-highlight transition-colors duration-200"
                            >
                              {reply.userId.username}
                            </Link>
                          ) : (
                            <span className="font-medium text-sm">
                              {reply.userId.username}
                            </span>
                          )}
                          <span className="text-xs lightmode-text-primary dark:darkmode-text-primary">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;