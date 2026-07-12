export default function PriceTable({ prices }) {
  return (
    <table className="price-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Store</th>
          <th>Price</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        {prices.map((entry) => (
          <tr key={entry.id}>
            <td>{entry.productName}</td>
            <td>{entry.supermarket}</td>
            <td>KSh {entry.price}</td>
            <td>{entry.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
