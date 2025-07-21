def response(success: bool, message: str, data: dict | None = None):
    return {
        "success": success,
        "message": message,
        "data": data,
    }
