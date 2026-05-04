-- Actualizar contraseñas con los hashes correctos
UPDATE usuarios SET contrasena = '$2b$10$YHoXbqdiyh3z2dKLFM5HZ.IgBw9d6GrqxKPYSbCFnVLExadsAdchu' WHERE email = 'admin@addjc.com';
UPDATE usuarios SET contrasena = '$2b$10$dqnSOMso6KA.iCtipphEi.Dkdqcx4E8jMpYGiQSjOB8v8hayfTPnK' WHERE email = 'comite@addjc.com';
UPDATE usuarios SET contrasena = '$2b$10$uQtYPEoLQLxm5WlCfL/mV.MEJo08zoUdoP6jJwi2pRc6ZqYJzqnTy' WHERE email = 'entrenador@addjc.com';
UPDATE usuarios SET contrasena = '$2b$10$fOYtM//Mr9v0z.h7KC9RkuCo9zApDKi9o0yTTjIHRQhe3W8.tihoK' WHERE email = 'atleta@addjc.com';

SELECT id, email, rol FROM usuarios ORDER BY id;
