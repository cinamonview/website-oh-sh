package com.ohsh.website.board;

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
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @PostMapping("/api/boards")
    public ResponseEntity<Board> save(@RequestBody Board board) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(boardService.save(board));
    }

    @GetMapping("/api/boards")
    public List<Board> findAll() {
        return boardService.findAll();
    }

    @GetMapping("/api/boards/{id}")
    public ResponseEntity<Board> findById(@PathVariable Long id) {
        return boardService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/api/boards/{id}")
    public ResponseEntity<Board> update(
            @PathVariable Long id,
            @RequestBody Board board) {
        return boardService.update(id, board.getTitle(), board.getContent())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/boards/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!boardService.delete(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
