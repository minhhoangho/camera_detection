from rest_framework import viewsets


class UserViewMixin(viewsets.ViewSet):
    def to_list(  # noqa
        self,
        items: list,
        total: int = 0,
        limit: int = 10,
        offset: int = 0,
        page: int | None = None,
        with_paginate=False,
    ) -> dict:
        if with_paginate:
            page_number = page or (offset // limit) + 1

            return dict(
                items=items,
                pagination=dict(limit=limit, total=total, offset=offset, page=page_number),
            )

        return dict(items=items)
