package com.example.ticketingsystem.service.impl;

import com.example.ticketingsystem.component.EntityMapper;
import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.request.CategoryRequest;
import com.example.ticketingsystem.dto.response.CategoryResponse;
import com.example.ticketingsystem.exception.DuplicateResourceException;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.model.Category;
import com.example.ticketingsystem.repository.CategoryRepository;
import com.example.ticketingsystem.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final MessageUtil messageUtil;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String trimmedName = request.getName().trim();

        if (categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException(
                    messageUtil.get("error.category.name.already.exists"));
        }

        Category category = Category.builder()
                .name(trimmedName)
                .build();

        categoryRepository.save(category);
        log.info("Category created: {}", trimmedName);
        return EntityMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return EntityMapper.toCategoryResponse(findCategoryById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(EntityMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategoryById(id);
        String trimmedName = request.getName().trim();

        // Check for duplicate, but allow updating to the same name (case-insensitive)
        if (!category.getName().equalsIgnoreCase(trimmedName)
                && categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException(
                    messageUtil.get("error.category.name.already.exists"));
        }

        category.setName(trimmedName);
        categoryRepository.save(category);
        log.info("Category {} updated to '{}'", id, trimmedName);
        return EntityMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);

        if (categoryRepository.existsByIdAndTicketsIsNotEmpty(id)) {
            throw new InvalidOperationException(messageUtil.get("error.category.has.tickets"));
        }

        categoryRepository.delete(category);
        log.info("Category {} deleted", id);
    }

    // Helper
    @Override
    public Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageUtil.get("error.category.not.found", id)));
    }
}
