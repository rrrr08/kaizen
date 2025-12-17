'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateUserMultiavatar } from '@/lib/multiavatar';

interface User {
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  avatarSeed?: string | null;
  [key: string]: any;
}

interface SmartAvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  user: User | null | undefined;
  fallbackClassName?: string;
}

export default function SmartAvatar({
  user,
  className = "w-10 h-10",
  fallbackClassName = "",
  ...props
}: SmartAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      generateAvatar();
    }
  }, [user]);

  const generateAvatar = () => {
    setIsLoading(true);

    if (!user) return;

    // If user has a custom photo, use it
    if (user.photoURL && !user.photoURL.startsWith('data:image/svg+xml')) {
      setAvatarUrl(user.photoURL);
      setIsLoading(false);
      return;
    }

    // If user has a multiavatar seed stored, use it
    if (user.avatarSeed) {
      const { dataUrl } = generateUserMultiavatar({ ...user, name: user.avatarSeed });
      setAvatarUrl(dataUrl);
      setIsLoading(false);
      return;
    }

    // Generate new multiavatar based on user data
    const { dataUrl } = generateUserMultiavatar(user);
    setAvatarUrl(dataUrl);
    setIsLoading(false);
  };

  // Fallback to initials if everything fails
  const getFallbackInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Avatar className={className} {...props}>
      {!isLoading && avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={user?.name || user?.email || 'User avatar'}
        />
      )}
      <AvatarFallback className={fallbackClassName}>
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        ) : (
          getFallbackInitials()
        )}
      </AvatarFallback>
    </Avatar>
  );
}
