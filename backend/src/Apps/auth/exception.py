class AuthErr:
    TOKEN_IS_REQUIRED = {"code": 1200, "message": "Invalid token header. Token string is required."}
    TOKEN_CONTAINS_SPACES = {
        "code": 1201,
        "message": "Invalid token header. Token string should not contain spaces.",
    }
    TOKEN_CONTAINS_INVALID_CHARACTERS = {
        "code": 1202,
        "message": "Invalid token header. Token string should not contain invalid characters.",
    }
