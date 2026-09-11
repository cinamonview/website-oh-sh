package com.ohsh.website.archive;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class ArchiveFileService {

    private final ArchiveFileRepository archiveFileRepository;

    public ArchiveFileService(ArchiveFileRepository archiveFileRepository) {
        this.archiveFileRepository = archiveFileRepository;
    }

    public ArchiveFile save(ArchiveFile archiveFile) {
        return archiveFileRepository.save(archiveFile);
    }

    public Optional<ArchiveFile> findById(Long id) {
        return archiveFileRepository.findById(id);
    }

    public List<ArchiveFile> findByArchiveId(Long archiveId) {
        return archiveFileRepository.findByArchiveId(archiveId);
    }
}