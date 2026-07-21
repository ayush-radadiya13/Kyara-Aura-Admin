import { NextResponse } from "next/server";

let categories = [
  {
    id: "1",
    name: "Apparel",
    slug: "apparel",
    description: "Fashion and wearable products",
    image_url: "",
    parent_id: null,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "2",
    name: "Accessories",
    slug: "accessories",
    description: "Lifestyle and accessory collections",
    image_url: "",
    parent_id: null,
    sort_order: 2,
    is_active: false,
  },
  {
    id: "3",
    name: "Tops",
    slug: "tops",
    description: "Apparel tops and shirts",
    image_url: "",
    parent_id: "1",
    parent_name: "Apparel",
    sort_order: 1,
    is_active: true,
  },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let filtered = categories;
  if (type === "main") {
    filtered = categories.filter((item) => !item.parent_id);
  } else if (type === "sub") {
    filtered = categories.filter((item) => Boolean(item.parent_id));
  }

  return NextResponse.json({
    data: filtered,
  });
}

export async function POST(request) {
  const body = await request.json();
  const parentId = body.parent_id || null;
  const parent = parentId
    ? categories.find((item) => String(item.id) === String(parentId))
    : null;

  const newCategory = {
    id: crypto.randomUUID(),
    name: body.name || "",
    slug: body.slug || "",
    description: body.description || "",
    image_url: body.image_url || body.image || "",
    parent_id: parentId,
    parent_name: parent?.name || "",
    sort_order: Number(body.sort_order ?? 0) || 0,
    is_active: Boolean(body.is_active ?? true),
  };

  categories = [newCategory, ...categories];

  return NextResponse.json({
    message: "Category created",
    data: newCategory,
  });
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();
  const parentId =
    body.parent_id === undefined
      ? undefined
      : body.parent_id || null;
  const parent =
    parentId === undefined
      ? undefined
      : parentId
        ? categories.find((item) => String(item.id) === String(parentId))
        : null;

  categories = categories.map((item) => {
    if (item.id !== id) return item;

    const nextParentId = parentId === undefined ? item.parent_id : parentId;

    return {
      ...item,
      ...body,
      parent_id: nextParentId,
      parent_name:
        parent === undefined
          ? item.parent_name
          : parent?.name || "",
      sort_order: Number(body.sort_order ?? item.sort_order ?? 0) || 0,
      is_active: body.is_active ?? item.is_active,
      image_url: body.image_url ?? body.image ?? item.image_url,
    };
  });
  const updated = categories.find((item) => item.id === id);

  return NextResponse.json({
    message: "Category updated",
    data: updated,
  });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  categories = categories.filter((item) => item.id !== id);

  return NextResponse.json({
    message: "Category deleted",
  });
}
