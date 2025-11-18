import { useQuery } from "@tanstack/react-query";
import { Contact } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Mail, Building, User, MessageSquare, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Contacts() {
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <p className="text-white text-lg">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div 
          className="rounded-3xl p-6"
          style={{
            background: "hsl(200, 80%, 45%)",
            backdropFilter: "blur(20px)",
            border: "1px solid white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Contact Submissions</h1>
            <Link href="/">
              <a className="text-white hover:underline">← Back to Home</a>
            </Link>
          </div>
          <p className="text-white/90 mt-2">
            {contacts?.length || 0} total submissions
          </p>
        </div>

        {/* Contacts List */}
        {contacts && contacts.length > 0 ? (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <Card
                key={contact.id}
                className="p-6 bg-white/95 backdrop-blur-sm"
                data-testid={`contact-${contact.id}`}
              >
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-semibold text-gray-900">{contact.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-semibold text-gray-900">{contact.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a 
                          href={`mailto:${contact.email}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(contact.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex items-start gap-3 pt-4 border-t">
                    <MessageSquare className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Message</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{contact.message}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white/95 backdrop-blur-sm">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No submissions yet
            </h3>
            <p className="text-gray-600">
              Contact form submissions will appear here
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
