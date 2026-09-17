package com.ohsh.website.qna;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class QnaService {

    private final QnaRepository qnaRepository;

    public QnaService(QnaRepository qnaRepository) {
        this.qnaRepository = qnaRepository;
    }

    public Qna save(Qna qna) {
        return qnaRepository.save(qna);
    }

    public Optional<Qna> findById(Long id) {
        return qnaRepository.findById(id);
    }

    public Optional<Qna> like(Long id) {
        return qnaRepository.findById(id)
                .map(qna -> {
                    qna.setLikeCount(qna.getLikeCount() == null ? 1L : qna.getLikeCount() + 1L);
                    return qnaRepository.save(qna);
                });
    }

    public boolean isOwner(Long id, String loginId) {
        return qnaRepository.findById(id)
                .map(qna -> qna.getWriter().equals(loginId))
                .orElse(false);
    }

    public Page<Qna> findAll(Pageable pageable) {
        return qnaRepository.findAll(pageable);
    }

    public List<Qna> findAll() {
        return qnaRepository.findAll();
    }

    public Optional<Qna> update(Long id, String title, String content) {
        return qnaRepository.findById(id)
                .map(qna -> {
                    qna.setTitle(title);
                    qna.setContent(content);
                    return qnaRepository.save(qna);
                });
    }

    public boolean delete(Long id) {
        return qnaRepository.findById(id)
                .map(qna -> {
                    qnaRepository.delete(qna);
                    return true;
                })
                .orElse(false);
    }
}
