const { google } = require('googleapis');

const client_email = "web-studio@studio-web-2.iam.gserviceaccount.com";
const private_key = "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+6BQH4Vd8+jN8\\ns456rb6y9DdXASarL5k5z5xgGsz8ogq4gIuNPeGPlbvx4FDd/t/vfFvheLwtqnzf\\nMyEOoss2wbxVdfUsPiL3vmiTsWlkiNSmfj/fzMeFEBylqbTbhBq1BU5qu2mizfHf\\nyX0+G32L9eGq7pjN0S0M81lLyG4cFokCT1d7mbYiGp0ZR7LoptDEUd7XUkdZgvuY\\nhQhxSmmfCVATpolAK+80P4x8ZTOoxMG+O2lu4BnePhSvXPjZRWRiffhkewEBFNI3\\nGIV0WJuj8tQVYrmMOzNLt+ctuEkIN4+iR59XB4NKiuiY6H9RQQwxDw2/9OINyBgM\\nYc6Mac51AgMBAAECggEAAqY63O8iJTBdtY3SXN57ZoVgHTt9W2PSNwysCWNl0921\\n02CpTyD8N99ml9E6nhIS7oJlzge8aM/UYs6VV1woAM8Ie5EjAWWtW43ParlMEqKZ\\nfOQEo+j2HeEe3KexxFgdfMShlXabXTCJekcUD2AXSnFzm8kq4rRT8TmRVC1oZche\\nI2B0NTLOdVsssuCGiMZaRuXjeWlTegx60i/33w4cPd/UYPPf48EGZVZXJpZWNH8T\\nsLGbq16irXHoUBukcvKt+Q0oWKq3ChdhYYVmGSOpt4fksORQ7yvCaZk6STTL2NA4\\ncplQ5mwv2BlvGLwDZZUQFXUnYHuth15pmNf+U7W9gwKBgQDl5a1yTQJW2Ky4KMKK\\nX9cozWbdTCrOYCWTtRqbz9wqw732k+GN48C/vrerA9ia4SIDVnblZ/JPnsust03M\\nLROQ8X65LXvW6F4W370IqcXxiSZyahnc9vnxm4weMLryMSXysDeAsatHILswF5Qn\\nbhnLJIVc+LUqh2UdHKi0DDVQwwKBgQDUlRO6NuQHj+ahgxrJT9g5+ofSmAR16cFd\\nkUjpmSHh+Yhbq+O09NxLpSyLyFm1ZXZ/+5kRDS0btjRozx4TmJiWA+Ow+r6CHIlI\\nGwsX31QTvk2n9QdTymYbKpKOLc1VQtqm/RthAai4fnTj8gdSyz1NkZucVTyeCdnp\\njb6vV8twZwKBgFS9hWJ1amBSu8+iDpts2mVK2RjHQ5wQqqk4f1dhlfkZb8MdHW3s\\nvpavGQprf4MPazcpvueumg2pLdA7POz+zJCHw7tEPbqoqk3qKMaxtanjcQ2JeIEP\\ndHAPcuWJ9s7hOOis9bh1RPoR4Y3Hky+5kL5ldtcfQcAsaiQB9VlwipJ7AoGAPPZL\\nY/ldxzVjJCoewmBdV7MaxC/IB7BzPUvupt69MrqGehN/B2O40RCbB7L61uQz6VvT\\nd2pZ5zqHKQ9MRr5Z85tF7njZrSJV1BG9SqlGySqnxmSkJ0lBosTApnlICw1S+tRW\\nx6jcI5xQFRZRN1MFT3tULq7a5U9Z6Ho3lr0MoD0CgYEAkQ638Ne3dVfKE6F48klo\\nP+LSGUsu5tbIubFvQqxZvazliJFBPIeLbBwyJefwAyGuKUJxwbuQxHStvckABQy6\\nMhJXHkpy+eytnycPc8ZjI3FeM1GOSjJVNDpu9QKfrgF0uIuLcyFBfGLmKg22Z1bV\\nGt13WouVjlk+X9FQ1Zt5g7M=\\n-----END PRIVATE KEY-----\\n";

async function test() {
  const credentials = {
    client_email,
    private_key: private_key.replace(/\\n/g, '\n')
  };
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive'] });
  const token = await auth.getAccessToken();
  console.log("Token generated:", token ? "YES" : "NO");
}
test().catch(console.error);
