import { NextResponse } from "next/server";

let categories = [
  {
    id: "1",
    name: "Apparel",
    description: "Fashion and wearable products",
    status: "active",
  },
  {
    id: "2",
    name: "Accessories",
    description: "Lifestyle and accessory collections",
    status: "inactive",
  },
];

export async function GET() {
  return NextResponse.json({
    data: categories,
  });
}

export async function POST(request) {
  const body = await request.json();

  const newCategory = {
    id: crypto.randomUUID(),
    ...body,
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

  categories = categories.map((item) => (item.id === id ? { ...item, ...body } : item));
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
