package com.ohsh.website.qna.comment;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/api/qnas/{qnaId}/comments")
    public ResponseEntity<Comment> save(
            @PathVariable Long qnaId,
            @RequestBody Comment comment) {
        return commentService.save(qnaId, comment)
                .map(savedComment -> ResponseEntity.status(HttpStatus.CREATED).body(savedComment))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/api/qnas/{qnaId}/comments")
    public List<Comment> findByQnaId(@PathVariable Long qnaId) {
        return commentService.findByQnaId(qnaId);
    }

    @GetMapping("/api/comments/{id}")
    public ResponseEntity<Comment> findById(@PathVariable Long id) {
        return commentService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/api/comments/{id}")
    public ResponseEntity<Comment> update(
            @PathVariable Long id,
            @RequestBody Comment comment) {
        return commentService.update(id, comment.getContent())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/comments/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!commentService.delete(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
