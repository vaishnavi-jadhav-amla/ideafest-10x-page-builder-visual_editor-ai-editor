export const filterObjectsByProperties = <T>(objects: T[], searchTerm: string, properties: (keyof T)[]): T[] => {
  // Convert the search term to lowercase for case-insensitive matching
  const formattedSearchTerm = searchTerm.toLocaleLowerCase();

  // Filter the objects based on the specified properties
  return objects.filter((object) => {
    return properties.some((property) => {
      // Get the value of the property from the object
      const value = object[property] as string | null;

      // Check if the value is not null and contains the search term
      return value !== null && value.toLocaleLowerCase().includes(formattedSearchTerm);
    });
  });
};
