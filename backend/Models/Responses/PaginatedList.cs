namespace VmsBackend.Models.Responses;

public class PaginatedList<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (TotalCount + PageSize - 1) / PageSize;
    public bool HasPreviousPage => CurrentPage > 1;
    public bool HasNextPage => CurrentPage < TotalPages;
}
