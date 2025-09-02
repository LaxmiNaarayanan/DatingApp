using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")] // localhost:5000/api/members
    [ApiController]
    public class BaseApiController : ControllerBase
    {
    }
}
