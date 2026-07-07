using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTrailCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "CoordinateX",
                table: "Trails",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "CoordinateY",
                table: "Trails",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Trails",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Trails",
                type: "REAL",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoordinateX",
                table: "Trails");

            migrationBuilder.DropColumn(
                name: "CoordinateY",
                table: "Trails");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Trails");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Trails");
        }
    }
}
