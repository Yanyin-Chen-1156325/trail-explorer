namespace backend.DTOs.Trail;

public class TrailSyncResult
{
    public bool Succeeded { get; set; }

    public int CandidatesFound { get; set; }

    public int Created { get; set; }

    public int Updated { get; set; }

    public int Skipped { get; set; }

    public string? ErrorMessage { get; set; }
}
