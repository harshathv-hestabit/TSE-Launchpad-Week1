# Original cURL request for "https://dummyjson.com/products?limit=5&skip=10"   
![alt text](<Postman Screenshots/cURL request.png>)     
## For Pagination, we have two parameters used here - limit and skip
- limt=5 denotes that response return only 5 products
- skip=10 denotes that the response must skip 10 products ids

# Sending request without 'user-agent' header
![alt text](<Postman Screenshots/No User-Agent header.png>)     
![alt text](<No user agent diff.png>)       
## From above snippets, we can observe that there is no difference in the response body after removing the user-agent header, in comparison to original request.    

# Sending request with Fake Authorization header
![alt text](<Postman Screenshots/Fake Authorization Header.png>)    
![alt text](<fake auth diff.png>)   
## From above snippets, we can infer that there is no difference captured when compared to the response bodies of both original curl request and the request with no user agent header.

## Based on above results, we can form an opinion that dummyjson.com does not require user-agent or authorization header for any specific results.

# Observing caching using e<tag>:
![alt text](<Postman Screenshots/etag value.png>)   
## etag header value in response headers
![alt text](<Postman Screenshots/etag.png>)     
## Since there is no modification in page resources, the cache was not updated and hence 304 Not Modified