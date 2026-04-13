package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.request.CategoryRequest;
import com.example.ticketingsystem.dto.response.CategoryResponse;
import com.example.ticketingsystem.model.Category;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse getCategoryById(Long id);
    List<CategoryResponse> getAllCategories();
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);

    // Helper
    Category findCategoryById(Long id);
}
