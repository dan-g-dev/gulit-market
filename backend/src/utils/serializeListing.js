// Converts a joined listing row (see models/listingModel.js) into the
// camelCase shape returned by the API.
export function serializeListing(row) {
  return {
    id: row.id,
    title: row.title,
    titleAm: row.title_am,
    description: row.description,
    descriptionAm: row.description_am,
    priceETB: Number(row.price_etb),
    condition: row.condition_type,
    isNegotiable: !!row.is_negotiable,
    status: row.status,
    isFeatured: !!row.is_featured,
    viewCount: row.view_count,
    images: row.images ?? [],
    category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
    location: { id: row.location_id, name: row.location_name, nameAm: row.location_name_am },
    seller: {
      id: row.seller_id,
      fullName: row.seller_full_name,
      storeName: row.store_name || row.seller_full_name,
      storeNameAm: row.store_name_am,
      verified: !!row.seller_verified,
      rating: row.seller_rating != null ? Number(row.seller_rating) : null,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
