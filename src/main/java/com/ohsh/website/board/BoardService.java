package com.ohsh.website.board;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public Optional<Board> like(Long id) {
        return boardRepository.findById(id)
                .map(board -> {
                    board.setLikeCount(board.getLikeCount() == null ? 1L : board.getLikeCount() + 1L);
                    return boardRepository.save(board);
                });
    }

    public boolean isOwner(Long id, String loginId) {
        return boardRepository.findById(id)
                .map(board -> board.getWriter().equals(loginId))
                .orElse(false);
    }

    public Page<Board> findAll(Pageable pageable) {
        return boardRepository.findAll(pageable);
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
