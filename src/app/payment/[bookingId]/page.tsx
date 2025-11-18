interface PaymentPageProps {
  params: Promise<{ bookingId: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { bookingId } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
      <p className="text-gray-600 mt-2">
        Payments for booking <span className="font-mono">{bookingId}</span> will be handled here soon.
      </p>
    </div>
  )
}

