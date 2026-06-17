from bson import ObjectId
from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Any


class PyObjectId(str):
    """Custom type for MongoDB ObjectId that serializes to string."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Any,
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_wrap_validator_function(
            cls._validate,
            core_schema.str_schema(),
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def _validate(cls, value: Any, handler: Any) -> "PyObjectId":
        if isinstance(value, ObjectId):
            return cls(str(value))
        if isinstance(value, str) and ObjectId.is_valid(value):
            return cls(value)
        raise ValueError(f"Invalid ObjectId: {value!r}")

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return {"type": "string", "example": "507f1f77bcf86cd799439011"}
