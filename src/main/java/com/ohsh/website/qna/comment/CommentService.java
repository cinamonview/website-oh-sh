package com.ohsh.website.qna.comment;

import java.util.List;
import java.util.Optional;

import com.ohsh.website.qna.QnaRepository;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final QnaRepository qnaRepository;

    public CommentService(CommentRepository commentRepository, QnaRepository qnaRepository) {
        this.commentRepository = commentRepository;
        this.qnaRepository = qnaRepository;
    }

    public Optional<Comment> save(Long qnaId, Comment comment) {
        if (!qnaRepository.existsById(qnaId)) {
            return Optional.empty();
        }

        comment.setQnaId(qnaId);
        return Optional.of(commentRepository.save(comment));
    }

    public Optional<Comment> findById(Long id) {
        return commentRepository.findById(id);
    }

    public boolean isOwner(Long id, String loginId) {
        return commentRepository.findById(id)
                .map(comment -> comment.getWriter() != null && comment.getWriter().equals(loginId))
                .orElse(false);
    }

    public List<Comment> findByQnaId(Long qnaId) {
        return commentRepository.findByQnaIdOrderByCreatedAtAsc(qnaId);
    }

    public Optional<Comment> update(Long id, String content) {
        return commentRepository.findById(id)
                .map(comment -> {
                    comment.setContent(content);
                    return commentRepository.save(comment);
                });
    }

    public boolean delete(Long id) {
        return commentRepository.findById(id)
                .map(comment -> {
                    commentRepository.delete(comment);
                    return true;
                })
                .orElse(false);
    }
}
