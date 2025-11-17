using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Route("api/[controller]")] // localhost:5000/api/members
    [ApiController]
    public class BaseApiController : ControllerBase
    {
    }
}
