// src/components/ui/Breadcrumbs.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

/**
 * Reusable breadcrumbs component that automatically generates breadcrumbs based on the current route
 * or can use custom breadcrumbs passed as props
 * 
 * @param {Object} props Component props
 * @param {Array} props.customCrumbs Optional custom breadcrumbs array of {href, label} objects
 * @param {boolean} props.includeHome Whether to include the home page in breadcrumbs
 */
export default function Breadcrumbs({ customCrumbs, includeHome = true }) {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Format city and state names from URL slugs
  const formatName = (slug) => {
    if (!slug) return '';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate breadcrumbs based on the current route
  useEffect(() => {
    if (customCrumbs) {
      setBreadcrumbs(customCrumbs);
      return;
    }

    const pathSegments = router.asPath.split('?')[0].split('/').filter(segment => segment);
    const generatedCrumbs = [];

    // Add home page if needed
    if (includeHome) {
      generatedCrumbs.push({
        href: '/',
        label: 'Home'
      });
    }

    // Generate breadcrumbs based on path segments
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Handle special cases based on segment position and content
      if (index === 0 && segment.length === 2) {
        // This is likely a state abbreviation
        generatedCrumbs.push({
          href: currentPath,
          label: segment.toUpperCase()
        });
      } else if (index === 1 && pathSegments[0].length === 2) {
        // This is likely a city name
        generatedCrumbs.push({
          href: currentPath,
          label: formatName(segment)
        });
      } else if (segment === 'restaurants') {
        // Add "Restaurants" label
        generatedCrumbs.push({
          href: currentPath,
          label: 'Restaurants'
        });
      } else if (index === pathSegments.length - 1 && !segment.includes('restaurants')) {
        // This is likely a restaurant slug
        generatedCrumbs.push({
          href: currentPath,
          label: formatName(segment)
        });
      } else {
        // Generic segment handling
        generatedCrumbs.push({
          href: currentPath,
          label: formatName(segment)
        });
      }
    });

    setBreadcrumbs(generatedCrumbs);
  }, [router.asPath, customCrumbs, includeHome]);

  // Don't render breadcrumbs on the homepage
  if (router.pathname === '/' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="text-sm mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && <span className="mx-2 text-soup-brown-400">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-soup-brown-600" aria-current="page">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-soup-red-600 hover:text-soup-red-700">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}