package com.ohsh.website.qna;

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
public class QnaController {

    private final QnaService qnaService;

    public QnaController(QnaService qnaService) {
        this.qnaService = qnaService;
    }

    @PostMapping("/api/qnas")
    public ResponseEntity<Qna> save(@RequestBody Qna qna) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(qnaService.save(qna));
    }

    @GetMapping("/api/qnas")
    public List<Qna> findAll() {
        return qnaService.findAll();
    }

    @GetMapping("/api/qnas/{id}")
    public ResponseEntity<Qna> findById(@PathVariable Long id) {
        return qnaService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/api/qnas/{id}")
    public ResponseEntity<Qna> update(
            @PathVariable Long id,
            @RequestBody Qna qna) {
        return qnaService.update(id, qna.getTitle(), qna.getContent())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/qnas/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!qnaService.delete(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
