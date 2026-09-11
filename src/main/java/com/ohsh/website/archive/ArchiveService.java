package com.ohsh.website.archive;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class ArchiveService {

    private final ArchiveRepository archiveRepository;

    public ArchiveService(ArchiveRepository archiveRepository) {
        this.archiveRepository = archiveRepository;
    }

    public Archive save(Archive archive) {
        return archiveRepository.save(archive);
    }

    public Optional<Archive> findById(Long id) {
        return archiveRepository.findById(id);
    }

    public List<Archive> findAll() {
        return archiveRepository.findAll();
    }

    public Optional<Archive> update(Long id, String title, String content) {
        return archiveRepository.findById(id)
                .map(archive -> {
                    archive.setTitle(title);
                    archive.setContent(content);
                    return archiveRepository.save(archive);
                });
    }

    public boolean delete(Long id) {
        return archiveRepository.findById(id)
                .map(archive -> {
                    archiveRepository.delete(archive);
                    return true;
                })
                .orElse(false);
    }
}
