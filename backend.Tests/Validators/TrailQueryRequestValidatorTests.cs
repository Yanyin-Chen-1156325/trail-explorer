using backend.DTOs.Trail;
using backend.Enums;
using backend.Validators;

namespace backend.Tests.Validators;

public class TrailQueryRequestValidatorTests
{
    private readonly TrailQueryRequestValidator _validator = new();

    [Fact]
    public void Validate_WithDefaultRequest_IsValid()
    {
        var result = _validator.Validate(new TrailQueryRequest());

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WithSearchLongerThanOneHundredCharacters_IsInvalid()
    {
        var result = _validator.Validate(new TrailQueryRequest
        {
            Search = new string('a', 101)
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Search must not exceed 100 characters");
    }

    [Fact]
    public void Validate_WithInvalidDifficulty_IsInvalid()
    {
        var result = _validator.Validate(new TrailQueryRequest
        {
            Difficulty = (TrailDifficulty)999
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Difficulty must be a valid trail difficulty");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WithInvalidPageNumber_IsInvalid(int pageNumber)
    {
        var result = _validator.Validate(new TrailQueryRequest
        {
            PageNumber = pageNumber
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Page number must be greater than or equal to 1");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(101)]
    public void Validate_WithInvalidPageSize_IsInvalid(int pageSize)
    {
        var result = _validator.Validate(new TrailQueryRequest
        {
            PageSize = pageSize
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Page size must be between 1 and 100");
    }
}
