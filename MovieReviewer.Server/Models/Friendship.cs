namespace MovieReviewer.Server.Models
{
    /// <summary>A friend request from Requester to Addressee. Once accepted, the two are friends.</summary>
    public class Friendship
    {
        public int Id { get; set; }

        public string RequesterId { get; set; } = string.Empty;
        public User? Requester { get; set; }

        public string AddresseeId { get; set; } = string.Empty;
        public User? Addressee { get; set; }

        public FriendshipStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
    }
}
