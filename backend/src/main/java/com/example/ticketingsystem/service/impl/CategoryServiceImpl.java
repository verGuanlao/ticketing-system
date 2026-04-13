package com.example.ticketingsystem.service.impl;

import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.model.Category;
import com.example.ticketingsystem.repository.CategoryRepository;
import com.example.ticketingsystem.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final MessageUtil messageUtil;

    @Override
    public Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageUtil.get("error.category.not.found", id)));
    }
}
