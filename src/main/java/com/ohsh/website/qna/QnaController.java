package com.ohsh.website.qna;

import jakarta.servlet.http.HttpSession;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class QnaController {

    private final QnaService qnaService;

    public QnaController(QnaService qnaService) {
        this.qnaService = qnaService;
    }

    @PostMapping("/api/qnas")
    public ResponseEntity<?> save(@RequestBody Qna qna, HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        qna.setWriter(loginId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(qnaService.save(qna));
    }

    @GetMapping("/api/qnas")
    public Page<Qna> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return qnaService.findAll(pageable);
    }

    @GetMapping("/api/qnas/{id}")
    public ResponseEntity<Qna> findById(@PathVariable("id") Long id) {
        return qnaService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/api/qnas/{id}")
    public ResponseEntity<?> update(
            @PathVariable("id") Long id,
            @RequestBody Qna qna,
            HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (qnaService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!qnaService.isOwner(id, loginId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return qnaService.update(id, qna.getTitle(), qna.getContent())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/qnas/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id, HttpSession session) {
        String loginId = (String) session.getAttribute("loginId");
        if (loginId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (qnaService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!qnaService.isOwner(id, loginId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!qnaService.delete(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
