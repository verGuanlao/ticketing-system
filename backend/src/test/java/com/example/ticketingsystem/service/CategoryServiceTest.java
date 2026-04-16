package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.request.CategoryRequest;
import com.example.ticketingsystem.dto.response.CategoryResponse;
import com.example.ticketingsystem.model.Category;
import com.example.ticketingsystem.exception.DuplicateResourceException;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.repository.CategoryRepository;
import com.example.ticketingsystem.service.impl.CategoryServiceImpl;
import com.example.ticketingsystem.component.MessageUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Tests")
class CategoryServiceTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private MessageUtil messageUtil;

    @InjectMocks private CategoryServiceImpl categoryService;

    private Category mockCategory;

    @BeforeEach
    void setUp() {
        mockCategory = Category.builder().id(1L).name("Technical").build();
    }

    // ─── createCategory ───────────────────────────────────────────────────────

    @Test
    @DisplayName("createCategory - success")
    void createCategory_success() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Technical");

        when(categoryRepository.existsByNameIgnoreCase("Technical")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(mockCategory);

        CategoryResponse response = categoryService.createCategory(request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Technical");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("createCategory - trims whitespace before saving")
    void createCategory_trimsName() {
        CategoryRequest request = new CategoryRequest();
        request.setName("  Billing  ");

        when(categoryRepository.existsByNameIgnoreCase("Billing")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoryResponse response = categoryService.createCategory(request);

        assertThat(response.getName()).isEqualTo("Billing");
    }

    @Test
    @DisplayName("createCategory - throws DuplicateResourceException when name already exists")
    void createCategory_throwsDuplicate_whenNameExists() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Technical");

        when(categoryRepository.existsByNameIgnoreCase("Technical")).thenReturn(true);
        when(messageUtil.get("error.category.name.already.exists")).thenReturn("Name already exists.");

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Name already exists.");
        verify(categoryRepository, never()).save(any());
    }

    // ─── getCategoryById ──────────────────────────────────────────────────────

    @Test
    @DisplayName("getCategoryById - success")
    void getCategoryById_success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        CategoryResponse response = categoryService.getCategoryById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Technical");
    }

    @Test
    @DisplayName("getCategoryById - throws ResourceNotFoundException for unknown ID")
    void getCategoryById_throwsNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());
        when(messageUtil.get(eq("error.category.not.found"), any())).thenReturn("Category not found.");

        assertThatThrownBy(() -> categoryService.getCategoryById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found.");
    }

    // ─── getAllCategories ─────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllCategories - returns mapped list")
    void getAllCategories_returnsList() {
        Category second = Category.builder().id(2L).name("Billing").build();
        when(categoryRepository.findAll()).thenReturn(List.of(mockCategory, second));

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(CategoryResponse::getName)
                .containsExactly("Technical", "Billing");
    }

    @Test
    @DisplayName("getAllCategories - returns empty list when no categories exist")
    void getAllCategories_returnsEmptyList() {
        when(categoryRepository.findAll()).thenReturn(List.of());

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertThat(result).isEmpty();
    }

    // ─── updateCategory ───────────────────────────────────────────────────────

    @Test
    @DisplayName("updateCategory - success with a new unique name")
    void updateCategory_success() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Hardware");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(categoryRepository.existsByNameIgnoreCase("Hardware")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoryResponse response = categoryService.updateCategory(1L, request);

        assertThat(response.getName()).isEqualTo("Hardware");
        verify(categoryRepository).save(mockCategory);
    }

    @Test
    @DisplayName("updateCategory - success when updating to the same name (case-insensitive, no duplicate check fires)")
    void updateCategory_success_sameNameCaseInsensitive() {
        CategoryRequest request = new CategoryRequest();
        request.setName("technical"); // same as existing "Technical", different case

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        // existsByNameIgnoreCase must NOT be called because the names match case-insensitively
        CategoryResponse response = categoryService.updateCategory(1L, request);

        assertThat(response.getName()).isEqualTo("technical");
        verify(categoryRepository, never()).existsByNameIgnoreCase(any());
    }

    @Test
    @DisplayName("updateCategory - throws DuplicateResourceException when new name conflicts with another category")
    void updateCategory_throwsDuplicate_whenNameConflicts() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Billing"); // different from "Technical" — conflict with another category

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(categoryRepository.existsByNameIgnoreCase("Billing")).thenReturn(true);
        when(messageUtil.get("error.category.name.already.exists")).thenReturn("Name already exists.");

        assertThatThrownBy(() -> categoryService.updateCategory(1L, request))
                .isInstanceOf(DuplicateResourceException.class);
        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateCategory - throws ResourceNotFoundException for unknown ID")
    void updateCategory_throwsNotFound() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Anything");

        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());
        when(messageUtil.get(eq("error.category.not.found"), any())).thenReturn("Category not found.");

        assertThatThrownBy(() -> categoryService.updateCategory(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── deleteCategory ───────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteCategory - success when category has no tickets")
    void deleteCategory_success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(categoryRepository.existsByIdAndTicketsIsNotEmpty(1L)).thenReturn(false);

        assertThatCode(() -> categoryService.deleteCategory(1L))
                .doesNotThrowAnyException();
        verify(categoryRepository).delete(mockCategory);
    }

    @Test
    @DisplayName("deleteCategory - throws InvalidOperationException when category has tickets")
    void deleteCategory_throwsInvalidOp_whenHasTickets() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(categoryRepository.existsByIdAndTicketsIsNotEmpty(1L)).thenReturn(true);
        when(messageUtil.get("error.category.has.tickets")).thenReturn("Category has tickets.");

        assertThatThrownBy(() -> categoryService.deleteCategory(1L))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("Category has tickets.");
        verify(categoryRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteCategory - throws ResourceNotFoundException for unknown ID")
    void deleteCategory_throwsNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());
        when(messageUtil.get(eq("error.category.not.found"), any())).thenReturn("Category not found.");

        assertThatThrownBy(() -> categoryService.deleteCategory(99L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(categoryRepository, never()).delete(any());
    }

    // ─── findCategoryById (public entity helper) ──────────────────────────────

    @Test
    @DisplayName("findCategoryById - returns raw Category entity")
    void findCategoryById_returnsEntity() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        Category result = categoryService.findCategoryById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Technical");
    }

    @Test
    @DisplayName("findCategoryById - throws ResourceNotFoundException for unknown ID")
    void findCategoryById_throwsNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());
        when(messageUtil.get(eq("error.category.not.found"), any())).thenReturn("Category not found.");

        assertThatThrownBy(() -> categoryService.findCategoryById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found.");
    }
}