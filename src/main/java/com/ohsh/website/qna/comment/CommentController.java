package com.ohsh.website.qna.comment;

import jakarta.servlet.http.HttpSession;
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
            @PathVariable("qnaId") Long qnaId,
            @RequestBody Comment comment,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        comment.setWriter(loginId);
        return commentService.save(qnaId, comment)
                .map(savedComment -> ResponseEntity.status(HttpStatus.CREATED).body(savedComment))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/api/qnas/{qnaId}/comments")
    public List<Comment> findByQnaId(@PathVariable("qnaId") Long qnaId) {
        return commentService.findByQnaId(qnaId);
    }

    @GetMapping("/api/comments/{id}")
    public ResponseEntity<Comment> findById(@PathVariable("id") Long id) {
        return commentService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/api/comments/{id}")
    public ResponseEntity<Comment> update(
            @PathVariable("id") Long id,
            @RequestBody Comment comment,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (commentService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!commentService.isOwner(id, loginId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return commentService.update(id, comment.getContent())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/comments/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") Long id,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (commentService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!commentService.isOwner(id, loginId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!commentService.delete(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
