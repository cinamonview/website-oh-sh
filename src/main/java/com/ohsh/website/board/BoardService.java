package com.ohsh.website.board;

import java.util.Optional;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class BoardService {

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    public Board save(Board board) {
        return boardRepository.save(board);
    }

    public Optional<Board> findById(Long id) {
        return boardRepository.findById(id);
    }

    public boolean isOwner(Long id, String loginId) {
        return boardRepository.findById(id)
                .map(board -> board.getWriter().equals(loginId))
                .orElse(false);
    }

    public List<Board> findAll() {
        return boardRepository.findAll();
    }

    public Optional<Board> update(Long id, String title, String content) {
        return boardRepository.findById(id)
                .map(board -> {
                    board.setTitle(title);
                    board.setContent(content);
                    return boardRepository.save(board);
                });
    }

    public boolean delete(Long id) {
        return boardRepository.findById(id)
                .map(board -> {
                    boardRepository.delete(board);
                    return true;
                })
                .orElse(false);
    }
}
